my @fileContents;
while(my $fileName = <>){
    if (open(my $file, $fileName)){
        chomp($fileName);
        my $width = 16;
        my $height= 16;
        $fileName =~ /(gallery-icons.+)\.json/;
        $pngName = $1;
        $pngName =~ s/\\/\//g;
        my $filePath = "$pngName.png";
        my @frames = ();
        my $foundFrames = 0;
        $fileName =~ /\\(\w+)\.json/;
        my $name = $1;
        if ($name !~ /meta/){
            while(<$file>) {
                if ($foundFrames and /"(\w+)"/){
                    push(@frames, $1);
                }
                if (/"width": (\d+)/) {
                    $width = $1;
                }
                if (/"height": (\d+)/) {
                    $height = $1;
                }
                if (/frames/){
                    $foundFrames = 1;
                }
            }
            my $frameObj = join("', '", @frames);
            push(@fileContents, "{ name: '$name', image: './$filePath', height: $height, width: $width, frames: ['$frameObj'] },\n"),
        }
    }
}

print "const gallery = [";
print @fileContents;
print '];';

# my @files = <>;
# foreach my $file (@files) {
#   print $file . "\n";
# }